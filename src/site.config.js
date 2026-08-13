// Configuración editable de la tienda. No requiere credenciales ni build
// flags: para cambiar el nombre de la tienda o las redes sociales, edita
// este archivo y despliega de nuevo.

export const siteConfig = {
  // Nombre mostrado en el header, el panel admin y el título de la pestaña.
  storeName: 'Tejidos Yolis',

  // Enlaces de contacto/redes que se muestran en la página /contacto.
  // Deja vacío ('') el valor de una red para que no se muestre.
  social: {
    whatsapp: 'https://wa.me/573143817069',
    instagram: 'https://www.instagram.com/yolanditarojas1?igsh=MXZjeGVqYnp3NGo4cQ==',
    facebook: '',
    tiktok: '',
    x: '',
  },

  // Ubicación del taller/tienda, mostrada en /contacto con un mapa embebido.
  // Deja mapEmbedUrl vacío ('') para no mostrar esta sección.
  // Para obtener el link: Google Maps → Compartir → Insertar un mapa → copia
  // solo el valor del atributo src del iframe.
  location: {
    name: 'El Espino, Boyacá',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d309.06614921488944!2d-72.49678478248451!3d6.482917078572871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e691385c8d3f455%3A0xd62aecae10ea434a!2sEl%20Espino%2C%20Boyac%C3%A1!5e1!3m2!1ses-419!2sco!4v1786653756507!5m2!1ses-419!2sco',
  },
}
