import boto3
import json
from botocore.exceptions import ClientError

def fetch_secret(secret_name, secret_key):
    region_name = "us-west-2"

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )

    except ClientError as e:
        raise e
    
    secret_dict = json.loads(get_secret_value_response['SecretString'])

    secret = secret_dict[secret_key]
    
    return secret 


