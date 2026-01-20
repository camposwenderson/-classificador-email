import { useState } from "react";
import axios from "axios";
import "./App.css";
import Logo from "./assets/logo-autou 1.svg";

function App() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
  });

  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append(
        "email_text",
        `
        Nome: ${form.nome}
        Email: ${form.email}
        `,
      );

      if (file) {
        formData.append("file", file);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/classify`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setResultado(response.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar o email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={Logo} alt="AutoU" width={187} height={52} />
        </div>
        <div className="lang">
          EN | <span className="selected">PT</span>
        </div>
      </header>
      {/* FORM */}
      <section className="form-section">
        <div className="form-container">
          <h2>Pronto para transformar seu negócio?</h2>
          <p>
            Em 30 minutos, mostraremos como IA pode gerar resultados concretos
            na sua empresa.
          </p>

          <div className="form">
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email corporativo"
              value={form.email}
              onChange={handleChange}
            />
            <label className="file-label">
              Upload de PDF
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="cta-button"
            >
              {loading ? "Enviando..." : "Agendar conversa"}
            </button>
          </div>

          {resultado && (
            <div className="resultado">
              <p>
                <strong>Categoria:</strong> {resultado.categoria}
              </p>
              <p>
                <strong>Resposta sugerida:</strong> {resultado.resposta}
              </p>
            </div>
          )}
        </div>
      </section>
      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src={Logo} alt="AutoU" width={140} />
            <p>
              Criamos soluções em IA que simplificam processos e geram
              resultados reais para empresas.
            </p>
          </div>

          <div className="footer-offices">
            <div>
              <h4>São Paulo</h4>
              <p>
                Alameda Vicente Pinzon, 54
                <br />
                Vila Olímpia, SP
                <br />
                04547-130
              </p>
            </div>

            <div>
              <h4>Rio de Janeiro</h4>
              <p>
                Avenida Rio Branco, 156
                <br />
                Centro, RJ
                <br />
                20040-901
              </p>
            </div>

            <div>
              <h4>Miami</h4>
              <p>
                21 SE 1st Ave #10
                <br />
                Miami, FL
                <br />
                33131
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} AutoU — Tecnologia que trabalha por você.
        </div>
      </footer>
    </>
  );
}

export default App;
