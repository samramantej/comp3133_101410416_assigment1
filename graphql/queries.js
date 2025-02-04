const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat, GraphQLID } = require("graphql");
const Employee = require("../models/Employee");
const User = require("../models/User"); // Ensure this line is present
const bcrypt = require("bcryptjs"); // Ensure bcrypt is imported
const jwt = require("jsonwebtoken"); // Ensure jwt is imported


const EmployeeType = new GraphQLObjectType({
  name: "Employee",
  fields: {
    _id: { type: GraphQLID },
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
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    message: {
      type: GraphQLString,
      resolve() {
        return "GraphQL API is working!";
      },
    },
    login: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("User not found!");
        }

        const isMatch = await bcrypt.compare(args.password, user.password);
        if (!isMatch) {
          throw new Error("Incorrect password!");
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return token;
      },
    },
    getAllEmployees: {
      type: new GraphQLList(EmployeeType),
      async resolve() {
        return await Employee.find();
      },
    },
    getEmployeeById: {
      type: EmployeeType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        const employee = await Employee.findById(args.id);
        if (!employee) {
          throw new Error("Employee not found!");
        }
        return employee;
      },
    },
    searchEmployees: {
      type: new GraphQLList(EmployeeType),
      args: {
        designation: { type: GraphQLString },
        department: { type: GraphQLString },
      },
      async resolve(parent, args) {
        let filter = {};

        if (args.designation) {
          filter.designation = args.designation;
        }
        if (args.department) {
          filter.department = args.department;
        }

        const employees = await Employee.find(filter);

        if (employees.length === 0) {
          throw new Error("No employees found with the given criteria!");
        }

        return employees;
      },
    },
  },
});

module.exports = RootQuery;
