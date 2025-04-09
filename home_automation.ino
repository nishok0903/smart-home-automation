#include "WiFi.h"
#include "PubSubClient.h"
#include "WiFiClientSecure.h"
#define EN_PIN 13      // Pin 1 (Enable 1) of L293D -> D13
#define IN1_PIN 12     // Pin 2 (Input 1) of L293D -> D12
#define IN2_PIN 14     // Pin 7 (Input 2) of L293D -> D14 


const char* SSID="[SSID]";
const char* password="[PASSWORD]";
const char*MQTT_Username="[USERNAME]";
const char*MQTT_Password="[PASSWORD]";
const char*MQTT_URL="[URL]";
const int MQTT_Port=8883;

int ledState;
int motorStatus;
int intensity;


WiFiClientSecure espClient;
PubSubClient client(espClient);

void LightHandler(byte *payload,unsigned int length)
{

String msg="";
    for(int i=0;i<length;i++)
    msg+=(char)(payload[i]);

    int n=msg.toInt();
    digitalWrite(16,HIGH);
      digitalWrite(19,HIGH);
      digitalWrite(23,HIGH);
      digitalWrite(2,HIGH);
      if(n==0)
      {
        ledState=0;
        digitalWrite(2,LOW);
        intensity=0;
        
      }
    else if(n==1)
    {
      
      ledState=1;
      digitalWrite(23,LOW);
      if(intensity==0)
        intensity=100;
      
      
    }
    else if(n==2)
    {
      
      ledState=2;
      digitalWrite(16,LOW);
      if(intensity==0)
        intensity=100;
     
    }
    else if(n==3)
    {
      
      ledState=3;
      digitalWrite(19,LOW);
      if(intensity==0)
        intensity=100;
      
      
    }
}

void MotorHandler(byte*payload,unsigned int length)
{
String msg="";
    for(int i=0;i<length;i++)
    msg+=(char)(payload[i]);

    int n=msg.toInt();

    if(n==0)
    {
      analogWrite(IN2_PIN,0);
      motorStatus=0;
    }
    else if(n==1)
    {
      analogWrite(IN2_PIN,127);
      motorStatus=1;
    }
    else if(n==2)
    {
      analogWrite(IN2_PIN,191);
      motorStatus=2;
    }
    else if(n==3)
    {
      analogWrite(IN2_PIN,255);
      motorStatus=3;
    }
}
String getStatusHandler()
{
String x="";
x+=String(ledState)+" ";
x+=String(motorStatus)+" ";
x+=String(intensity);
return x;  
}
void IntensityHandler(byte* payload,unsigned int length)
{
String msg="";
    for(int i=0;i<length;i++)
    msg+=(char)(payload[i]);

    int n=msg.toInt();
    intensity=n;

    analogWrite(2,n);
}
void messageReceived(char* topic, byte* payload, unsigned int length) 
{
  if(String(topic)=="/light")
  LightHandler(payload,length);   
  else if(String(topic)=="/getstatus")
  {
    String x=getStatusHandler();
    const char*y=x.c_str();
    client.publish("/status",y,x.length());
  }
  else if(String(topic)=="/motor")
  MotorHandler(payload,length);

  else if(String(topic)=="/intensity")
  IntensityHandler(payload,length);
  
       
      
}
void MQTTConnect()
{
  
  espClient.setInsecure();//Should change later, get HiveMQ's cert?
  
  if(client.connect("ESP_32",MQTT_Username,MQTT_Password))
  {
    Serial.println("Successfully Connected to HiveMQ");
    client.subscribe("/light");
    client.subscribe("/getstatus");
    client.subscribe("/motor");
    client.subscribe("/intensity");
    String x=getStatusHandler();
    const char*y=x.c_str();
    client.publish("/status",y,x.length());

  }
  else
  Serial.println("Unsuccesful HiveMQ");
}
bool wifiSetUp()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID,password);
  delay(1000);
  if(WiFi.status()!=WL_CONNECTED)
  {
    Serial.print("Connecting Failed!");
    return false;
  }
  return true;
}
void setup() {
  Serial.begin(115200);
  pinMode(23,OUTPUT);
  pinMode(16,OUTPUT);
  pinMode(19,OUTPUT);
  pinMode(2,OUTPUT);
  pinMode(EN_PIN, OUTPUT);    // Enable motor driver
  pinMode(IN1_PIN, OUTPUT);   // Motor direction control 1
  pinMode(IN2_PIN, OUTPUT);   // Motor direction control 2
  digitalWrite(EN_PIN, HIGH);   // Enable the motor driver (Pin 1 on L293D)
 digitalWrite(IN1_PIN, LOW);  // Set direction of motor (input 1) 
  digitalWrite(IN2_PIN, LOW);   // Set direction of motor (input 2)



  ledState=0;
  motorStatus=0;
  intensity=0;
  
  if(wifiSetUp())
  {
    Serial.println("One Step Done");
    client.setServer(MQTT_URL,MQTT_Port);
    client.setCallback(messageReceived);
    MQTTConnect();
    
  } 

}


           

void loop() {  
if (!client.connected() && WiFi.status() == WL_CONNECTED) {
  MQTTConnect();
}
client.loop(); 


}

