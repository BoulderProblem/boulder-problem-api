import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { AwsCredentialIdentity } from '@aws-sdk/types'
import { randomUUID } from 'node:crypto'
import r2Config from '#config/r2'

export default class FileService {
  private client: S3Client

  constructor() {
    if (process.env.NODE_ENV === 'test') {
      return
    }

    if (!r2Config.accessKeyId || !r2Config.secretAccessKey) {
      throw new Error('Missing R2 credentials')
    }

    const credentials: AwsCredentialIdentity = {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    }

    this.client = new S3Client({
      region: r2Config.region ?? 'auto',
      endpoint: r2Config.endpoint,
      credentials,
    })
  }

  /**
   * Upload un fichier dans R2
   * @returns clé R2 (à stocker en DB)
   */
  public async uploadFile(file: any, folder: string = ''): Promise<string> {
    const extension = file.extname?.startsWith('.') ? file.extname.slice(1) : file.extname

    const key = `${folder}/${randomUUID()}.${extension}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.headers['content-type'],
      })
    )

    return key
  }

  public async getFile(key: string) {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
      })
    )

    return result
  }

  /**
   * Supprime un fichier
   */
  public async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: r2Config.bucket,
        Key: key,
      })
    )
  }
}
