@echo off
cd frontend-react
call npm test -- --coverage --verbose
cd ..
