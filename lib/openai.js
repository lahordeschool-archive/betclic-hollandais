const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const contextBuilder = {
  async login() {
    return {
    };
  },
  async register() {
    return {
    };
  },
  async hub() {
    return {
    };
  },
  async skull() {
    return {
    };
  },
  async instructions() {
    return {
    };
  },
  async ide() {
    return {
    };
  },
  async user_joined_team(user) {
    if (user.team == null || user.team.ship == null) {
      user = await User.findFullUser(user._id);
    }

    return {
      autopilotName: user.team.ship.autopilotName,
      shipClass: user.team.ship.class,
      shipName: user.team.ship.name,
      userFirstname: user.firstname,
      userLastname: user.lastname,
      teamName: user.team.name,
      date: new Date().toISOString(),
      day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    };
  },
  async activity_completed({ user, activity, ship }) {
    if (user.team == null || user.team.ship == null) {
      user = await User.findFullUser(user._id);
    }

    console.log(ship);
    console.log(ship.autopilotName);

    return {
      autopilotName: ship.autopilotName,
      shipClass: ship.class,
      shipName: ship.name,
      userFirstname: user.firstname,
      userLastname: user.lastname,
      teamName: user.team.name,
      activityName: activity.name,
      date: new Date().toISOString(),
      day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    };
  },
  async morning_message({ team, ship }) {
    return globalMessageContext({ team, ship });
  },
  async lunch_message({ team, ship }) {
    return globalMessageContext({ team, ship });
  },
  async evening_message({ team, ship }) {
    return globalMessageContext({ team, ship });
  },
};

const globalMessageContext = ({ team, ship }) => {
  return {
    autopilotName: ship.autopilotName,
    shipClass: ship.class,
    shipName: ship.name,
    teamName: team.name,
    date: new Date().toISOString(),
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  };
};

const generateLiveMessage = async function (messageType, params, target) {
  const MAX_RETRY = 2;
  let retryCount = 0;

  const context = await contextBuilder[`${messageType}`](params);

  const text = fs.readFileSync(
    path.join(__dirname, "openai") + `/${messageType}.txt`,
    "utf8"
  );

  const message = text.replace(/\${(.*?)}/g, (_, v) => context[v]);

  while (retryCount <= MAX_RETRY) {
    try {
      const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: [{ role: "system", content: message }],
      });

      if (target == "discord" && context.autopilotName) {
        const spacer = "-".repeat(context.autopilotName.length + 11);
        return (
          context.autopilotName +
          " Autopilot: \n " +
          spacer +
          " \n" +
          removeQuotes(result.data.choices[0].message.content)
        );
      } else {
        return removeQuotes(result.data.choices[0].message.content);
      }
    } catch (error) {
      retryCount++;

      if (retryCount > MAX_RETRY) {
        return "Brain freezed, I cannot generate a live message right now.";
      }
    }
  }
};

function removeQuotes(str) {
  if (str.startsWith('"') && str.endsWith('"')) {
    // Remove first and last characters (quotes)
    return str.substring(1, str.length - 1);
  } else {
    return str;
  }
}

const intentTypes = {
  createActivity: "createActivity",
  deleteActivity: "deleteActivity",
  updateTeam: "updateTeam",
};

const extractIntent = async function (messages, context) {
  try {
    const systemMessage = fs.readFileSync(
      path.join(__dirname, "openai") + `/extract_intent.txt`,
      "utf8"
    );
    let context = {
      intents: Object.values(intentTypes).join(", "),
    };
    const openaiExtract = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: systemMessage.replace(/\${(.*?)}/g, (_, v) => context[v]),
        },
        { role: "user", content: messages },
      ],
    });
    console.log(openaiExtract.data.choices[0].message.content);

    if (
      openaiExtract.data.choices[0].message.content &&
      openaiExtract.data.choices[0].message.content.includes(":") &&
      Object.values(intentTypes).includes(
        openaiExtract.data.choices[0].message.content.split(":")[1].trim()
      )
    ) {
      return intentTypes[openaiExtract.data.choices[0].message.content.split(":")[1].trim()];
    } else {
      return "";
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { generateLiveMessage, extractIntent };
