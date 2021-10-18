yarn build
cd dist
zip tmp.zip -r --exclude="*.git*" --exclude="*.zip" .
aws s3 cp tmp.zip s3://hka-gruppe11-backend/fn.zip
aws lambda update-function-code --function-name backend --region=us-east-1/tmp.zip --region=us-east-1 --s3-bucket=hka-gruppe11-backend --s3-key=fn.zip
rm tmp.zip
cd ..