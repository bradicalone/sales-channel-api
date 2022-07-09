class User {
    constructor(db) {
      this.collection = db.collection('customers');
      this.addUser = this.addUser
    }
    /* user - Object */
    async updateUser(user) {
      const updatedUser = await this.collection.updateOne(
            {"id": user.id},
            { $setOnInsert: user }
        );
      return updatedUser;
    }
    async updateField(id, obj) {
        const updatedUser = await this.collection.updateOne(
              {"id": id},
              { $set: obj }
          );
        return updatedUser;
      }
    /* user - Object */
    async addUser(user) {
        const newUser = await this.collection.insertOne(user);
        return newUser;
    }
    async getUser(id) {
        console.log('id:', id)
        const customer = await this.collection.findOne({id});
        console.log('customer:', customer)
        return customer;
    }
}
module.exports = User;