import ResponseMessages from "../../../../contants/responseMessages.js";
import catchAsyncError from "../../../../helpers/catchAsyncError.js";
import ErrorHandler from "../../../../helpers/errorHandler.js";
import validators from "../../../../utils/validators.js";
import utility from "../../../../utils/utility.js";
import models from "../../../../models/index.js";

/// @route  POST /api/v1/send-verify-email-otp

const sendRegisterOtp = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler(ResponseMessages.EMAIL_REQUIRED, 400));
    }

    if (email && !validators.validateEmail(email)) {
        return next(new ErrorHandler(ResponseMessages.INVALID_EMAIL, 400));
    }

    let user = await models.User.findOne({ email });

    if (user) {
        return next(new ErrorHandler(ResponseMessages.ACCOUNT_ALREADY_EXISTS, 400));
    }

    // Generating OTP
    const { otp, expiresAt } = await utility.generateOTP();

    await models.OTP.create({
        otp,
        expiresAt,
        email,
    });

    const htmlMessage = `<p>Khod Codak Yastas:</p>
    <h2>${otp}</h2>
    <p>El Code dah yasta shaghal lemodet 15 minutes wi testakhdemo marra wa7da ha.</p>
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
            email: email,
            subject: `Khod Yasta Codak: ${otp}`,
            htmlMessage: htmlMessage,
        });
    console.log(${otp})
        res.status(200).json({
            success: true,
            message: ResponseMessages.OTP_SEND_SUCCESS,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 400));
    }
});

export default sendRegisterOtp;
