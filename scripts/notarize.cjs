require("dotenv").config();
const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== "darwin") {
        return;
    }

    if (process.env.SKIP_NOTARIZATION != null) {
        console.log("Skipping notarization!");
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        tool: "notarytool",
        appBundleId: "com.contripity.textualize",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
        teamId: process.env.TEAMID,
    });
};
