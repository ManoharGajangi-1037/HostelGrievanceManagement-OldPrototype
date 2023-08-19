// Import dependencies
const express =require('express');

const mongoose =require('mongoose');
const bodyParser =require('body-parser');

//Create an instance of the express application
const app = express();
app.use(express.static('public'));
app.use(express.static(__dirname));
//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dorm', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create a Mongoose schema for the registrations
const registrationSchema = new mongoose.Schema({
  name:String,
  email: String,
  password: String,
  user:String,
  // usertype:String
});

// Create a Mongoose model for the registrations
const Registration = mongoose.model('Registration', registrationSchema);


const querySchema = new mongoose.Schema({
  Id: String,
  Name: String,
  Hostel: String,
  Wing: String,
  Issue: String,
  Description: String,
  Status: String
});

// Create a Mongoose model for the queries
const Query = mongoose.model('Query', querySchema);

// Handle the grievance submission POST request
app.post('/submit-grievance', (req, res) => {
  // Get the data from the request body
  const id = req.body.id;
  const name = req.body.name;
  const hostel = req.body.hostel;
  const wing = req.body.wing;
  const issue = req.body.issue;
  const description = req.body.description;

  // Create a new query document
  const query = new Query({
    Id: id,
    Name: name,
    Hostel: hostel,
    Wing: wing,
    Issue: issue,
    Description: description,
    Status: 'Pending'
  });

  // Save the query to the database
  query.save()
    .then(() => {
      console.log('Query saved:', query);
      res.sendStatus(200); // Send a success response
    })
    .catch((error) => {
      console.error('Error saving query:', error);
      res.sendStatus(500); // Send an error response
    });
});



// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });


  app.post('/signup', (req, res) => {
    // Get the data from the request body
    const name =req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const user = req.body.user;
    console.log(name);
    console.log(email);
    // Create a new registration document
    const registration = new Registration({
      name :name,
      email: email,
      password: password,
      user: user
    });
  
    // Save the registration to the database
    registration.save()
      .then(() => {
        console.log('Registration saved:', registration);
        res.sendStatus(200); // Send a success response
      })
      .catch((error) => {
        console.error('Error saving registration:', error);
        res.sendStatus(500); // Send an error response
      });
  });
  

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    // Find a registration document with the given email and password
    Registration.findOne({ email, password })
      .then((registration) => {
        if (registration) {
          // Email and password match, login success
          console.log('Login success');
          res.status(200).json({ name: registration.name, user: registration.user ,email:registration.email}); // Send the name and user type as response
        } else {
          // Email and password do not match, login failed
          console.log('Login failed');
          res.sendStatus(500);
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        res.sendStatus(500); // Send an error response
      });
  });
  app.get('/get-grievances', (req, res) => {
    const name = req.query.name;
  
    Query.find({ Name: name })
      .sort({ Status: 1, _id: -1 }) // Sort by Status in ascending order and _id in descending order
      .exec()
      .then(grievances => {
        const pendingGrievances = grievances.filter(grievance => grievance.Status === 'Pending');
        const acceptedGrievances = grievances.filter(grievance => grievance.Status === 'Accepted');
        const sortedGrievances = pendingGrievances.concat(acceptedGrievances);
        res.status(200).json(sortedGrievances);
      })
      .catch(error => {
        console.error('Error retrieving grievances:', error);
        res.sendStatus(500);
      });
  });

  app.get('/grievances', (req, res) => {
    const { hostel } = req.query;
  
    Query.find({ Hostel: hostel })
      .sort({ Status: -1, _id: -1 })
      .exec()
      .then((grievances) => {
        res.status(200).json(grievances);
      })
      .catch((error) => {
        console.error('Error retrieving grievances:', error);
        res.sendStatus(500);
      });
  });

  app.put('/grievances/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    Query.findByIdAndUpdate(id, { Status: status }, { new: true })
      .exec()
      .then(updatedGrievance => {
        res.status(200).json(updatedGrievance);
      })
      .catch(error => {
        console.error('Error updating grievance status:', error);
        res.sendStatus(500);
      });
  });
// app.get('/grievances', (req, res) => {
//   Query.find({})
//     .sort({ Status: -1, _id: -1 })
//     .exec()
//     .then((grievances) => {
//       res.status(200).json(grievances);
//     })
//     .catch((error) => {
//       console.error('Error retrieving grievances:', error);
//       res.sendStatus(500);
//     });
// });

  

// Start the server
app.listen(4000, () => {
  console.log('Server started on port 4000');
});


