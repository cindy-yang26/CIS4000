package com.cis4000.examify.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.ByteArrayInputStream;
import java.net.URLConnection;
import java.util.Base64;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.region}")
    private String region;

    public String uploadBase64Image(String fileExtension, String base64Image) {
        // Decode the base64 string to byte array
        byte[] decodedBytes = Base64.getDecoder().decode(base64Image);

        // Generate a unique filename for the image
        String uniqueFileName = UUID.randomUUID().toString() + '.' + fileExtension;

        // Initialize the S3 client
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();

        // Create a PutObject request
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueFileName)
                .contentType(URLConnection.guessContentTypeFromName(fileExtension))
                .build();

        // Upload the image to S3
        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(new ByteArrayInputStream(decodedBytes), decodedBytes.length));

        // Generate the S3 file URL
        String fileUrl = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + uniqueFileName;

        return fileUrl;
    }

    public void deleteImage(String fileUrl) {
        // Extract the filename from the URL
        String fileKey = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

        // Initialize the S3 client
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .build();

        // Create a DeleteObject request
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .build();

        // Delete the object from S3
        s3Client.deleteObject(deleteObjectRequest);
    }
}
