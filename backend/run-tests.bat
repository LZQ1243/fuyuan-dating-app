@echo off
cd backend
call npm test -- --coverage --verbose
cd ..
