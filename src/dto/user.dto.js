export default class UserDTO {
    constructor(usuario) {
      this.id = usuario.id || usuario._id;
      this.first_name = usuario.first_name;
      this.last_name = usuario.last_name;
      this.email = usuario.email;
      this.age = usuario.age;
      this.role = usuario.role;
      this.cart = usuario.cart;
    }
  }
  