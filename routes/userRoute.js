const express = require('express')
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getuserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController')

const { isAunthenticatedUser, authorizeRoles } = require('../middleware/auth')
const router = express.Router()


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)

router.route("/logout").get(logout)

router.route("/me").get(isAunthenticatedUser, getuserDetails)

router.route("/password/update").put(isAunthenticatedUser, updatePassword)

router.route("/me/update").put(isAunthenticatedUser, updateProfile)

router.route("/admin/users").get(isAunthenticatedUser, authorizeRoles("admin"), getAllUsers)

router.route("/admin/user/:id").get(isAunthenticatedUser, authorizeRoles("admin"), getSingleUser).put(isAunthenticatedUser, authorizeRoles("admin"), updateUserRole).delete(isAunthenticatedUser, authorizeRoles("admin"), deleteUser)


module.exports = router