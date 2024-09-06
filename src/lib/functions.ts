export const formatDate = (date: Date) => {
    // Obtiene el día, mes y año
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0-11, por eso se suma 1
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };