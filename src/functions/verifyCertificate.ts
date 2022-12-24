import {APIGatewayProxyHandler} from "aws-lambda";
import {document} from "../utils/dynamodbClient";

interface ICertificate {
  id: string;
  name: string;
  grade: string;
  date: string;
}

const bucketName = "certificate-node-js-pedrodamiao";

const getCertificateUrl = (key: string) => {
  return `https://${bucketName}.s3.amazonaws.com/${key}.pdf`;
}

export const handler: APIGatewayProxyHandler = async (event) => {

  const { id } = event.pathParameters;

  const alreadyGeneratedCertificate = await document.query({
    TableName: 'users_certificate',
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    }
  }).promise();

  const certificate = alreadyGeneratedCertificate.Items[0] as ICertificate;

  if(!certificate){
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Certificate does not exists',
      }),
      headers: {
        'Content-type': 'application/json'
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Valid certificate',
      name: certificate.name,
      grade: certificate.grade,
      emitedAt: certificate.date,
      url: getCertificateUrl(id),
    })
  }

}
