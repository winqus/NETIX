import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const uri = 'mongodb://localhost:27017/test12345';

const addressSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.UUID,
  street: String,
  city: String,
  state: String,
  zip: Number,
});

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.UUID,
  name: String,
  age: Number,
  address: addressSchema,
  friendUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, default: () => Date.now(), immutable: true },
});

const addressModel = mongoose.model('Address', addressSchema);
const userModel = mongoose.model('User', userSchema);

(async () => {
  await mongoose.connect(uri);

  const addressIdString = uuidv4();
  console.log('addressIdString:', addressIdString);

  const address = new addressModel({
    _id: new mongoose.Types.UUID(addressIdString),
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: 62701,
  });

  const userIdString = uuidv4();
  console.log('userIdString:', userIdString);

  const user = new userModel({
    _id: new mongoose.Types.UUID(userIdString),
    name: 'Homer Simpson',
    age: 39,
    address: address,
  });

  await address.save();
  await user.save();

  const users = await userModel.find().populate('friendUser');

  console.log(users);

  await mongoose.connection.close();
})();
