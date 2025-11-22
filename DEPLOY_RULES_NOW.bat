@echo off
echo ========================================
echo  Deploying Firestore Rules and Indexes
echo ========================================
echo.

echo Deploying security rules...
firebase deploy --only firestore:rules

echo.
echo Deploying indexes...
firebase deploy --only firestore:indexes

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Please refresh your app to see changes.
echo.
pause
