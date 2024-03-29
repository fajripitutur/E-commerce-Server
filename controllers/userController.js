const {User} = require('../models');
const {comparePassword} = require('../helpers/passwordHelper');
const {generateToken} = require('../helpers/jwt');

class UserController{

  static register(req, res, next) {
    let newUser = {
      email: req.body.email,
      password: req.body.password
    }
    User.create(newUser)
      .then(user => {
        res.status(201).json({user})
      })
      .catch(err => {
        let errors = []
        err.errors.map( err => {
          errors.push(err.message)
        })
        if(errors) {
          next({status_code: 400, message: errors})
        }else {
          next({status_code: 500, message: "internal server error"})
        }
      })
  }

  static login(req, res, next){
    let {id, email, password} = req.body
    User.findOne({where: {email}})
      .then(user => {
        if (user) {
          const validPass = comparePassword(password, user.password);
          
          if(validPass){
            let payload = { id: user.id, email: user.email, role:user.role}
            res.status(200).json({
              id,
              email,
              access_token:generateToken(payload)
            }) 
          } else{
            throw { msg: 'invalid email or password' }
          }
        }else{
          throw { msg: 'invalid email or password' }
        }
      })
      .catch(err => {
        if (err.errors){
          let errors = [];
          err.errors.forEach(error => {
            errors.push(error.message)
          })
          if ( errors.length ){
            next({status_code: 400, message: errors})
          } else {
            next({status_code: 500, message: 'invalid internal server'})
          }
        }else {
          next({status_code: 400, message: err})
        }
      })
  }
}

module.exports = UserController