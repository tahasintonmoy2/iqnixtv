import {
  PersonalizeEventsClient,
  PutEventsCommand,
} from "@aws-sdk/client-personalize-events";
import {
  GetPersonalizedRankingCommand,
  GetRecommendationsCommand,
  PersonalizeRuntimeClient,
} from "@aws-sdk/client-personalize-runtime";

export interface PersonalizeRecommendation {
  itemId: string;
  score?: number;
  metadata?: Record<string, string>;
}

export interface PersonalizeEvent {
  userId: string;
  itemId: string;
  eventType: "VIEW" | "RATE" | "COMPLETE" | "LIKE" | "DISLIKE";
  timestamp: Date;
  properties?: Record<string, unknown>;
}

export class AWSPersonalizeService {
  private personalizeRuntime: PersonalizeRuntimeClient;
  private personalizeEvents: PersonalizeEventsClient;

  constructor() {
    this.personalizeRuntime = new PersonalizeRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.personalizeEvents = new PersonalizeEventsClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getRecommendations(
    userId: string,
    campaignArn: string,
    limit: number = 10
  ): Promise<PersonalizeRecommendation[]> {
    try {
      const command = new GetRecommendationsCommand({
        campaignArn,
        userId,
        numResults: limit,
      });

      const response = await this.personalizeRuntime.send(command);

      return (
        response.itemList?.map((rec): PersonalizeRecommendation => ({
          itemId: rec.itemId!,
          score: rec.score,
          metadata: rec.metadata,
        })) || []
      );
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  async getPersonalizedRanking(
    userId: string,
    itemIds: string[],
    campaignArn: string
  ): Promise<PersonalizeRecommendation[]> {
    try {
      const command = new GetPersonalizedRankingCommand({
        campaignArn,
        userId,
        inputList: itemIds,
      });

      const response = await this.personalizeRuntime.send(command);

      return (
        response.personalizedRanking?.map((rec) => ({
          itemId: rec.itemId!,
          score: rec.score,
          metadata: rec.metadata,
        })) || []
      );
    } catch (error) {
      console.error("Error getting personalized ranking:", error);
      return [];
    }
  }

  async trackEvent(event: PersonalizeEvent): Promise<void> {
    try {
      const command = new PutEventsCommand({
        trackingId: process.env.PERSONALIZE_TRACKING_ID,
        userId: event.userId,
        sessionId: event.userId, // You might want to generate unique session IDs
        eventList: [
          {
            eventId: `${event.userId}-${event.itemId}-${event.timestamp.getTime()}`,
            eventType: event.eventType,
            itemId: event.itemId,
            sentAt: event.timestamp,
            properties: event.properties
              ? JSON.stringify(event.properties)
              : undefined,
          },
        ],
      });

      await this.personalizeEvents.send(command);
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  }

  async trackUserInteraction(
    userId: string,
    itemId: string,
    eventType: PersonalizeEvent["eventType"],
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      itemId,
      eventType,
      timestamp: new Date(),
      properties,
    });
  }
}
