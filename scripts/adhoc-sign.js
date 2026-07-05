'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');

// electron-builder afterPack hook.
//
// When building without a Developer ID (identity: null), electron-builder
// skips signing entirely, which leaves Electron's original signatures broken
// after repacking. Gatekeeper then shows quarantined downloads the "app is
// damaged and can't be opened" dialog with no bypass. Re-signing the whole
// bundle ad hoc makes the signature internally valid again, so users get the
// normal "unverified developer" flow (System Settings -> Open Anyway).
module.exports = async function adHocSignUnsignedMacBuilds(context) {
  if (context.electronPlatformName !== 'darwin') return;
  // Only for unsigned builds; real Developer ID signing (when configured)
  // happens after this hook and must not be interfered with.
  if (process.env.CSC_IDENTITY_AUTO_DISCOVERY !== 'false') return;

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit'
  });
  execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], {
    stdio: 'inherit'
  });
  console.log(`  • ad-hoc signed ${appPath}`);
};
