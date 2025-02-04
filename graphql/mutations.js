const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID } = require("graphql");
const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // ✅ Signup Mutation (User Registration)
    signup: {
      type: GraphQLString,
      args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        // Input Validation
        if (!args.username || args.username.length < 3) {
          throw new Error("Username must be at least 3 characters long!");
        }
        if (!args.email.includes("@")) {
          throw new Error("Invalid email format!");
        }
        if (args.password.length < 6) {
          throw new Error("Password must be at least 6 characters long!");
        }

        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = new User({
          username: args.username,
          email: args.email,
          password: hashedPassword,
        });

        await newUser.save();
        return "User registered successfully!";
      },
    },

    // ✅ Add New Employee Mutation
    addEmployee: {
      type: GraphQLString,
      args: {
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLFloat },
        date_of_joining: { type: GraphQLString },
        department: { type: GraphQLString },
        employee_photo: { type: GraphQLString },
      },
      async resolve(parent, args) {
        // Input Validation
        if (!args.first_name || args.first_name.length < 2) {
          throw new Error("First name must be at least 2 characters long!");
        }
        if (!args.last_name || args.last_name.length < 2) {
          throw new Error("Last name must be at least 2 characters long!");
        }
        if (!args.email.includes("@")) {
          throw new Error("Invalid email format!");
        }
        if (args.salary < 1000) {
          throw new Error("Salary must be at least 1000!");
        }
        if (!["Male", "Female", "Other"].includes(args.gender)) {
          throw new Error("Gender must be Male, Female, or Other!");
        }

        const existingEmployee = await Employee.findOne({ email: args.email });
        if (existingEmployee) {
          throw new Error("Employee with this email already exists!");
        }

        const newEmployee = new Employee({
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          gender: args.gender,
          designation: args.designation,
          salary: args.salary,
          date_of_joining: new Date(args.date_of_joining),
          department: args.department,
          employee_photo: args.employee_photo || "",
        });

        await newEmployee.save();
        return "Employee added successfully!";
      },
    },

    // ✅ Update Employee by ID Mutation
    updateEmployee: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLID },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLFloat },
        date_of_joining: { type: GraphQLString },
        department: { type: GraphQLString },
        employee_photo: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const employee = await Employee.findById(args.id);
        if (!employee) {
          throw new Error("Employee not found!");
        }

        // Update fields if provided
        if (args.first_name) employee.first_name = args.first_name;
        if (args.last_name) employee.last_name = args.last_name;
        if (args.email) employee.email = args.email;
        if (args.gender) employee.gender = args.gender;
        if (args.designation) employee.designation = args.designation;
        if (args.salary) employee.salary = args.salary;
        if (args.date_of_joining) employee.date_of_joining = new Date(args.date_of_joining);
        if (args.department) employee.department = args.department;
        if (args.employee_photo) employee.employee_photo = args.employee_photo;

        employee.updated_at = new Date();
        await employee.save();
        return "Employee updated successfully!";
      },
    },

    // ✅ Delete Employee by ID Mutation
    deleteEmployee: {
      type: GraphQLString,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        const employee = await Employee.findById(args.id);
        if (!employee) {
          throw new Error("Employee not found!");
        }

        await Employee.findByIdAndDelete(args.id);
        return "Employee deleted successfully!";
      },
    },
  },
});

module.exports = Mutation;
