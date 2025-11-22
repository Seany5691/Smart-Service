@echo off
echo ========================================
echo   Tasks Feature - Firebase Deployment
echo ========================================
echo.
echo This will deploy:
echo   - Firestore Security Rules
echo   - Firestore Indexes
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Deploying Firestore Rules...
call firebase deploy --only firestore:rules

echo.
echo Deploying Firestore Indexes...
call firebase deploy --only firestore:indexes

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Wait 1-2 minutes for indexes to build
echo Then refresh your app to use the Tasks feature
echo.
echo Check index status at:
echo https://console.firebase.google.com/project/_/firestore/indexes
echo.
pause
