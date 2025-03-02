from flask import Flask, request, jsonify
from flask_cors import CORS
import wikipediaapi
import networkx as nx
import torch
from transformers import pipeline
from collections import defaultdict
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

wiki = wikipediaapi.Wikipedia(user_agent="lumen_ask_api/0.0", language="en")

qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def fetch_wikipedia_article(title):
  """Fetch Wikipedia article content."""
  page = wiki.page(title)
  if not page.exists():
    return None
  return page.text

def fetch_wikipedia_sections(title):
  """Fetch Wikipedia sections and exclude irrelevant ones."""
  EXCLUDED_SECTIONS = {"see also", "references", "external links", "further reading", "notes", "bibliography"}
  
  page = wiki.page(title)
  if not page.exists():
    return None

  sections = {}
  for section in page.sections:
    if section.title.lower() not in EXCLUDED_SECTIONS:
      sections[section.title] = [sub.text for sub in section.sections] if section.sections else [section.text]

  return sections

def summarize_section(text):
  """Summarize a Wikipedia section using a transformer model."""
  if not text:
    return ""
  try:
    summary = summarizer(text[:2000], max_length=100, min_length=30, do_sample=False)
    return summary[0]["summary_text"]
  except:
    return ""

def create_mind_map(title):
  """Generate a mind map from Wikipedia article sections."""
  sections = fetch_wikipedia_sections(title)
  if not sections:
    return None

  graph = nx.DiGraph()
  mind_map_data = defaultdict(list)

  for section, subsections in sections.items():
    if not section or len(section.strip()) == 0:
      continue

    print(f"# {section}")
    summary = summarize_section(" ".join(subsections))
    graph.add_node(section, summary=summary)
    
    for subsection in subsections:
      if not subsection or len(subsection.strip()) == 0:
        continue

      print(subsection)
      subsection_summary = summarize_section(subsection)
      graph.add_edge(section, subsection_summary)

    mind_map_data[section].append(summary)

  return mind_map_data

def extract_citation(content, answer):
  """Find the most relevant sentence in the content as a citation for the answer."""
  sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', content)  # Split into sentences

  if not sentences:
    return None

  # Use TF-IDF to find the most similar sentence
  vectorizer = TfidfVectorizer().fit_transform([answer] + sentences)
  cosine_similarities = cosine_similarity(vectorizer[0:1], vectorizer[1:]).flatten()

  best_match_index = cosine_similarities.argmax()
  return sentences[best_match_index] if cosine_similarities[best_match_index] > 0.2 else None

@app.route("/api/ask", methods=["POST"])
def ask_document():
  """API for answering questions based on document content with citation support."""
  data = request.json
  question = data.get("question")
  content = data.get("content")

  if not question:
      return jsonify({"error": "Missing question."}), 400
  if content is None:
      return jsonify({"error": "Article not found."}), 404

  answer = qa_pipeline({"question": question, "context": content[:2000]})
  answer_text = answer["answer"]

  # Extract a citation
  citation = extract_citation(content, answer_text)

  return jsonify({
    "question": question,
    "answer": answer_text,
    "citation": citation
  })

@app.route("/api/mindmap", methods=["POST"])
def generate_mindmap():
  """API endpoint to generate a mind map from a Wikipedia article."""
  data = request.json
  title = data.get("title")

  if not title:
    return jsonify({"error": "Missing title."}), 400

  mind_map = create_mind_map(title)
  
  expect_to_pop = []
  for section, summary in mind_map.items():
    print(f"# {section}")
    print(summary)
    # if the section is empty, remove it
    if len(summary) == 1 and len(summary[0].strip()) == 0:
      expect_to_pop.append(section)
      
  for section in expect_to_pop:
    mind_map.pop(section)
    
  if not mind_map:
    return jsonify({"error": "Article not found or no valid content."}), 404

  return jsonify({"title": title, "map": mind_map})

if __name__ == "__main__":
  app.run(debug=True, port=9874)
