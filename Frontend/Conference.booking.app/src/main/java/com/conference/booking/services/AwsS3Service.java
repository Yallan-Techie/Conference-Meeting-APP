package com.conference.booking.services;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import com.conference.booking.exception.OurException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Service
public class AwsS3Service {

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.access.key}")
    private String awsS3AccessKey;

    @Value("${aws.s3.secret.key}")
    private String awsS3SecretKey;

    @Value("${aws.s3.region}")
    private String awsS3Region;

    public String saveImageToS3(MultipartFile photo) {
        try {
            String s3Filename = UUID.randomUUID() + "_" + photo.getOriginalFilename();

            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(awsS3AccessKey, awsS3SecretKey);
            Region region = Region.of(awsS3Region);

            S3Client s3Client = S3Client.builder()
                    .region(region)
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Filename)
                    .contentType(photo.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(photo.getInputStream(), photo.getSize()));

            return "https://" + bucketName + ".s3." + awsS3Region + ".amazonaws.com/" + s3Filename;

        } catch (IOException e) {
            throw new OurException("Unable to upload image to s3 bucket: " + e.getMessage());
        }
    }
}