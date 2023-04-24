import ResponseMessages from "../../../../contants/responseMessages.js";
import catchAsyncError from "../../../../helpers/catchAsyncError.js";
import ErrorHandler from "../../../../helpers/errorHandler.js";
import models from "../../../../models/index.js";
import utility from "../../../../utils/utility.js";
import validators from "../../../../utils/validators.js";

/// @route  POST /api/v1/forgot-password

const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler(ResponseMessages.EMAIL_REQUIRED, 400));
  }

  if (email && !validators.validateEmail(email)) {
    return next(new ErrorHandler(ResponseMessages.INVALID_EMAIL, 400));
  }

  const user = await models.User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler(ResponseMessages.USER_NOT_FOUND, 400));
  }

  if (user.accountStatus !== "active" && user.accountStatus !== "deactivated") {
    return res.status(401).json({
      success: false,
      accountStatus: user.accountStatus,
      message: ResponseMessages.ACCOUNT_NOT_ACTIVE,
    });
  }

  // Generating OTP
  const { otp, expiresAt } = await utility.generateOTP();

  await models.OTP.create({
    otp,
    expiresAt,
    user: user._id,
  });

  const htmlMessage = `<p>Ezzayak Yasta ${user.fname},</p>
  <p>Khod Ya 3am Codak Aho Bs eb2a Rakez el Marra Eli Gayya 😂:</p>
  <h2>${otp}</h2>
  <p>
    Lw 3andak ay moshkela, Kallem Rayen
    <a href=” “></a> Insert “tel:01204543684” Doos Hena 3ashan tekalemo <a href=”tel:01204543684></a>.
    </p>
    <p>This is a auto-generated email. Please do not reply to this email.</p>
    <p>
    Regards, <br />
    El Wa7sh Rio
    </p>`;

  try {
    await utility.sendEmail({
      email: user.email,
      subject: `Codak Yasta: ${otp}`,
      htmlMessage: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: ResponseMessages.OTP_SEND_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
});

export default forgotPassword;
