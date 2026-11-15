import { Link } from "react-router-dom";
import goldShapeLogo from "../../../../../../assets/goldshape-logo.png";
import { RegisterForm } from "../components/register-form";
import "../login.css";

function Brand() {
  return (
    <Link className="brand register-page__brand" to="/" aria-label="GOLDSHAPE, início">
      <img className="brand-mark" src={goldShapeLogo} alt="" width={44} height={44} />
      <span>
        <span className="brand__name-gold">GOLD</span>SHAPE
      </span>
    </Link>
  );
}

export function RegisterView() {
  return (
    <main className="login-page register-page">
      <section className="register-card" aria-labelledby="register-title">
        <Brand />
        <span className="login-panel__welcome">CRIE SUA CONTA</span>
        <h1 id="register-title">
          Faça parte da <span>GOLDSHAPE</span>
        </h1>
        <p className="login-panel__subtitle">
          Crie sua conta para acompanhar seus pedidos e aproveitar a loja.
        </p>
        <RegisterForm />
        <p className="login-panel__signup">
          Já tem uma conta? <Link to="/session">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
