import catchAsyncError from "../../../helpers/catchAsyncError.js";
import ErrorHandler from "../../../helpers/errorHandler.js";
import ResponseMessages from "../../../contants/responseMessages.js";
import pkg from 'google-play-scraper'; // Import google-play-scraper package
const { app } = pkg;

/// CHECK UPDATE FROM GOOGLE PLAY STORE ///

const checkUpdateFromGooglePlayStore = catchAsyncError(async (req, res, next) => {
    const { packageName, currentVersion } = req.body;

    if (!packageName) {
        return next(new ErrorHandler(ResponseMessages.PACKAGE_NAME_REQUIRED, 400));
    }

    if (!currentVersion) {
        return next(new ErrorHandler(ResponseMessages.CURRENT_VERSION_REQUIRED, 400));
    }

    const response = await app({appId: packageName}); // Fetch app details from Google Play Store using package name

    if (!response) {
        return next(new ErrorHandler(ResponseMessages.APP_NOT_FOUND, 400));
    }

    const latestVersion = response.version;
    const changelog = response.recentChanges;
    const publishedAt = response.released;
    const downloadUrl = `https://play.google.com/store/apps/details?id=${packageName}`; // Construct download URL using package name

    let isUpdateAvailable = false;
    let message = ResponseMessages.NO_UPDATE_AVAILABLE;

    if (latestVersion !== currentVersion) {
        isUpdateAvailable = true;
        message = ResponseMessages.UPDATE_AVAILABLE;
    }

    return res.status(200).json({
        success: true,
        message: message,
        isUpdateAvailable,
        data: {
            currentVersion,
            latestVersion,
            changelog,
            publishedAt,
            downloadUrl
        }
    });
})

export default checkUpdateFromGooglePlayStore;
