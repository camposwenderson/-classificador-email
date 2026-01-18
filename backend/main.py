# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import os
from transformers import pipeline

# ===================== Configurações =====================
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}

app = Flask(__name__)
CORS(app, origins="*")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ===================== Pipeline Zero-Shot =====================
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

# ===================== Funções =====================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def read_pdf(filepath):
    text = ""
    reader = PdfReader(filepath)
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text.strip() + " "
    return text.strip()

def classify_pdf(pdf_text):
    text_lower = pdf_text.lower()
    keywords = ["por favor", "encaminhem", "necessário", "até", "prazo"]
    if any(k in text_lower for k in keywords):
        return {
            "categoria": "Produtivo",
            "score": 1.0,
            "resposta": "Obrigado pelo contato! Vamos analisar seu email."
        }

    # fallback: usar o modelo zero-shot
    result = classifier(
        pdf_text,
        candidate_labels=["Produtivo", "Improdutivo"],
        hypothesis_template="Este email requer alguma ação: {}."
    )
    categoria = result["labels"][0]
    score = result["scores"][0]
    resposta = "Obrigado pelo contato! Vamos analisar seu email." if categoria == "Produtivo" else "Agradecemos seu email. Entraremos em contato se necessário."
    return {"categoria": categoria, "score": score, "resposta": resposta}


# ===================== Rotas =====================
@app.route("/api/classify", methods=["POST"])
def classify_route():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo PDF enviado."}), 400

    file = request.files["file"]
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Arquivo inválido. Apenas PDFs são aceitos."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    pdf_text = read_pdf(filepath)
    if not pdf_text:
        return jsonify({"error": "Não foi possível extrair texto do PDF."}), 400

    result = classify_pdf(pdf_text)
    return jsonify(result)

# ===================== Inicialização =====================
if __name__ == "__main__":
    app.run(debug=True, port=8080)
