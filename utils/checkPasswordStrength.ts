export const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
  
    switch (strength) {
      case 0:
      case 1:
        return "Muito Fraca";
      case 2:
        return "Fraca";
      case 3:
        return "Média";
      case 4:
        return "Forte";
      case 5:
        return "Muito Forte";
      default:
        return "Insira uma senha";
    }
  };