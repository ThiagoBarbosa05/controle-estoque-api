
import { DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand } from "@aws-sdk/client-dynamodb";
import axios, { AxiosError } from "axios";

const db = new DynamoDBClient({ region: "us-east-2" });
const BLING_API_URL = "https://www.bling.com.br/Api/v3/oauth/token";
const DYNAMODB_TABLE_NAME = "BlingToken";

interface BlingTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function getRefreshTokenFromDynamoDB(): Promise<string | undefined> {
   const input: GetItemCommandInput = {
      TableName: "BlingToken",
      Key: {
        id: { S: "bling_refresh_token" }
      }
    }
    const getTokenCommand = new GetItemCommand(input);
    const tokenResponse = await db.send(getTokenCommand);

    if (!tokenResponse.Item || !tokenResponse.Item.value) {
      throw new Error("Refresh token not found in DynamoDB.");
    }

    return tokenResponse.Item.value.S
  
  // return Item.value.S as string;
}

async function storeTokensInDynamoDB(accessToken: string, refreshToken: string): Promise<void> {
  const accessTokenCommand = new PutItemCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Item: {
      id: { S: "bling_access_token" },
      value: { S: accessToken },
    },
  });

  const refreshTokenCommand = new PutItemCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Item: {
      id: { S: "bling_refresh_token" },
      value: { S: refreshToken },
    },
  });

  await Promise.all([
    db.send(accessTokenCommand),
    db.send(refreshTokenCommand),
  ]);
}

async function refreshTokenWithRetry(refreshToken?: string, retries = 3, delay = 1000): Promise<BlingTokenResponse> {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token not found.");
    }

    const params = new URLSearchParams()

    params.append("grant_type", "refresh_token")
    params.append("refresh_token", refreshToken)

    const response = await axios.post<BlingTokenResponse>(
     "https://www.bling.com.br/Api/v3/oauth/token",
     params,
      {
        headers: {
          Authorization: `Basic YjBmYWM1Y2JkOTVjYTJhMzMzMzNjZGM3ODNlZTViMjRlNTEwMDkwYjplYjQwNjdjYmM0MGM1OGEwZDhiOWVkNjM3NGQzZjFiZDAzZjdmZmE2YWI4YjEyM2M0NDJhODUyOTVmODY=`,
        },
      }
    );

    console.log( response.data)

    return response.data
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return refreshTokenWithRetry(refreshToken, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const handler = async (): Promise<void> => {
  try {
    console.log("Starting Bling token refresh process...");
    const refreshToken = await getRefreshTokenFromDynamoDB();
    console.log(refreshToken)
    const { access_token, refresh_token } = await refreshTokenWithRetry(refreshToken);
    await storeTokensInDynamoDB(access_token, refresh_token);
    console.log("Bling tokens refreshed and stored successfully.");
  } catch (error) {
    if(error)
    console.error("Error refreshing Bling token:", error);
    // Depending on the error, you might want to send a notification
    // to a monitoring service (e.g., CloudWatch Alarms, SNS).
    throw error; // Re-throwing the error to ensure the Lambda execution fails
  }
};
