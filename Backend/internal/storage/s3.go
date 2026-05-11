package storage

import (
	"context"
	"net/url"
	"time"

	"github.com/irfanzuhdiabdillah/mdm-compro/backend/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3Storage struct {
	client *minio.Client
	bucket string
}

func NewS3(cfg config.Config) (S3Storage, error) {
	client, err := minio.New(cfg.S3Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3AccessKey, cfg.S3SecretKey, ""),
		Secure: cfg.S3UseSSL,
	})
	if err != nil {
		return S3Storage{}, err
	}
	return S3Storage{client: client, bucket: cfg.S3Bucket}, nil
}

func (s S3Storage) PresignedPutURL(ctx context.Context, objectKey string, expires time.Duration) (*url.URL, error) {
	return s.client.PresignedPutObject(ctx, s.bucket, objectKey, expires)
}

func (s S3Storage) PresignedGetURL(ctx context.Context, objectKey string, expires time.Duration) (*url.URL, error) {
	return s.client.PresignedGetObject(ctx, s.bucket, objectKey, expires, nil)
}
