import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import axios from 'axios';
import 'dotenv/config'

export async function getBlingAccessToken(code: string): Promise<void> {
  if (!process.env.BLING_CREDENTIALS) {
    console.error('Client ID ou Client Secret do Bling não configurados.');
    return;
  }

  try {
    // const credentials = Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      'https://www.bling.com.br/Api/v3/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${process.env.BLING_CREDENTIALS}`,
        },
      }
    );

    const { access_token, refresh_token } = response.data;

     console.log('Tokens recebidos com sucesso!', access_token, refresh_token);

    const db = new DynamoDBClient({ region: "us-east-2", credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_KEY as string
    } });

    // const updateParams = {
    //   TableName: 'BlingToken',
    //   Key: {
    //     id: { S: 'Bling' }, 
    //   },
    //   UpdateExpression: 'SET tokens.access_token = :access_token, tokens.refresh_token = :refresh_token',
    //   ExpressionAttributeValues: {
    //     ':access_token': { S: access_token },
    //     ':refresh_token': { S: refresh_token },
    //   },
    // };

    //  const updateTokenCommand = new UpdateItemCommand(updateParams);
    //  const updatedTokenResponse = await db.send(updateTokenCommand);

    const accessTokenCommand = new PutItemCommand({
        TableName: "BlingToken",
        Item: {
          id: { S: "bling_access_token" },
          value: { S: access_token },
        },
      });
    
      const refreshTokenCommand = new PutItemCommand({
        TableName: "BlingToken",
        Item: {
          id: { S: "bling_refresh_token" },
          value: { S: refresh_token },
        },
      });
    
      await Promise.all([
        db.send(accessTokenCommand),
        db.send(refreshTokenCommand),
      ]);
    // console.log('Tokens atualizados com sucesso', updatedTokenResponse)
    console.log(access_token, refresh_token)


  } catch (error) {
    console.error('Erro ao trocar o código por tokens:', error);
  }
}