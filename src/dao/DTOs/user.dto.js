
export default class UserDTO {
    constructor(user) {
        this._id = user._id
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.photo = user.photo;
        this.cart = user.cart
        this.documents = user.documents;
        this.status = user.status;
        this.role = user.role;
    }
}