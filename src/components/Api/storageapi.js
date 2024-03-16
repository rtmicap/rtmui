import AWS from 'aws-sdk';
import fs from 'fs';
import config from '../../env.json';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.awsAccessKey,
  secretAccessKey: config.awsSecret,
  region: 'us-west-2'
});

const s3 = new AWS.S3();

async function uploadFilesToS3(files, bucketName) {
  try {
    // Check if bucket exists
    const bucketExists = await s3.headBucket({ Bucket: bucketName }).promise().catch(() => false);
    if (!bucketExists) {
      // Create bucket
      await s3.createBucket({ Bucket: bucketName }).promise();
      console.log(`Bucket '${bucketName}' created successfully.`);
      
      // Set CORS configuration for the bucket
      const corsParams = {
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
              ExposeHeaders: []
            }
          ]
        }
      };
      await s3.putBucketCors(corsParams).promise();
      console.log(`CORS configuration set for bucket '${bucketName}'.`);
    }

    // Proceed with file uploads
    const promises = files.map(async (file) => {
      const fileContent = fs.readFileSync(file);

      // Upload the file to S3
      const params = {
        Bucket: bucketName,
        Key: file,
        Body: fileContent
      };

      const uploadResult = await s3.upload(params).promise();
      return uploadResult;
    });

    // Wait for all uploads to complete
    const results = await Promise.all(promises);

    return {
      success: true,
      message: 'Files uploaded successfully',
      data: results
    };
  } catch (err) {
    return {
      success: false,
      message: 'Error uploading files to S3',
      error: err
    };
  }
}

export default uploadFilesToS3;
