from flask import Flask, request, jsonify
import pdfplumber
from docx import Document
import spacy
import re
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

nlp = spacy.load('./ner_model')

def extract_text_from_pdf(pdf_file):
    text = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_text_from_txt(text_file):
    with open(text_file, 'r') as txt_file:
        text = txt_file.read()
    return text

def extract_text_from_docx(word_file):
    doc = Document(word_file)
    text = ""
    for para in doc.paragraphs:
        text += para.text
    return text

def preprocess_text(text):
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_entities(text):
    doc = nlp(text)
    data = []
    for ent in doc.ents:
        data.append({'label': ent.label_, 'text': ent.text})
    return data

def find_not_found_keywords(resume_keywords, job_keywords):
    resume_labels = set([k['label'] for k in resume_keywords])
    job_labels = set([k['label'] for k in job_keywords])
    return list(job_labels - resume_labels)

@app.route('/score', methods=['POST'])
def score_resume():
    if 'resume' not in request.files or 'job_description' not in request.form:
        return jsonify({'error': 'Missing file or job description'}), 400
    file = request.files['resume']
    job_description = request.form['job_description']
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    ext = filename.split('.')[-1].lower()
    if ext == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif ext == 'docx':
        text = extract_text_from_docx(file_path)
    elif ext == 'txt':
        text = extract_text_from_txt(file_path)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400
    text = preprocess_text(text)
    job_description = preprocess_text(job_description)
    resume_keywords = extract_entities(text)
    job_keywords = extract_entities(job_description)
    # Use unique entity labels/texts for matching
    resume_set = set((k['label'], k['text'].strip().lower()) for k in resume_keywords)
    job_set = set((k['label'], k['text'].strip().lower()) for k in job_keywords)
    matched = job_set & resume_set
    score = 0
    if job_set:
        score = round((len(matched) / len(job_set)) * 100, 2)
    not_found = [label for label, text in job_set if (label, text) not in resume_set]
    os.remove(file_path)
    return jsonify({'score': score, 'not_found_keywords': not_found})

@app.route('/entities', methods=['POST'])
def get_entities():
    if 'resume' not in request.files:
        return jsonify({'error': 'Missing file'}), 400
    file = request.files['resume']
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    ext = filename.split('.')[-1].lower()
    if ext == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif ext == 'docx':
        text = extract_text_from_docx(file_path)
    elif ext == 'txt':
        text = extract_text_from_txt(file_path)
    else:
        return jsonify({'error': 'Unsupported file type'}), 400
    text = preprocess_text(text)
    entities = extract_entities(text)
    os.remove(file_path)
    return jsonify({'entities': entities})

if __name__ == '__main__':
    app.run(debug=True)
