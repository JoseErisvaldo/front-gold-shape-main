import { Alert, Button, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegisterForm } from "../hooks/use-register-form";

const fields = [
  {
    name: "name",
    label: "Nome completo",
    type: "text",
    autoComplete: "name",
    placeholder: "Seu nome",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    autoComplete: "email",
    placeholder: "voce@email.com",
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Pelo menos 6 caracteres",
  },
  {
    name: "confirmPassword",
    label: "Confirmar senha",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Digite a senha novamente",
  },
] as const;

export function RegisterForm() {
  const {
    control,
    formState: { errors, isSubmitting },
    notice,
    registeredUser,
    onSubmit,
  } = useRegisterForm();

  if (registeredUser) {
    return (
      <div className="register-form__success">
        <Alert severity="success" role="status">
          Conta criada para {registeredUser.name}. Sua conta tem perfil de usuário comum.
        </Alert>
        <Button
          component={Link}
          to="/session"
          className="login-form__submit"
          variant="contained"
          fullWidth
          disableElevation
        >
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <form className="register-form" onSubmit={onSubmit} noValidate>
      {fields.map(({ name, label, type, autoComplete, placeholder }) => (
        <div className="login-form__field" key={name}>
          <label className="login-form__label" htmlFor={`register-${name}`}>
            {label}
          </label>
          <Controller
            control={control}
            name={name}
            render={({ field }) => {
              const { ref, ...fieldProps } = field;
              const error = errors[name];
              return (
                <TextField
                  {...fieldProps}
                  inputRef={ref}
                  id={`register-${name}`}
                  className="login-field"
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  fullWidth
                  error={Boolean(error)}
                  helperText={error?.message}
                  slotProps={{ htmlInput: { "aria-label": label } }}
                />
              );
            }}
          />
        </div>
      ))}

      {notice && (
        <Alert className="login-form__notice" severity="error" role="alert">
          {notice}
        </Alert>
      )}

      <Button
        className="login-form__submit"
        type="submit"
        variant="contained"
        fullWidth
        disableElevation
        disabled={isSubmitting}
      >
        {isSubmitting ? "Criando conta…" : "Criar minha conta"}
        <span aria-hidden="true" className="login-form__submit-arrow">
          →
        </span>
      </Button>
    </form>
  );
}
