@echo off
echo Dang cap nhat code len server...
git add .
set /p "msg=Nhap noi dung thay doi: "
git commit -m "%msg%"
git push origin main
echo Da day code len Vercel/Cloudflare. He thong se tu dong redeploy!
pause
