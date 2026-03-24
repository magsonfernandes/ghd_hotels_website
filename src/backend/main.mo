import Time "mo:core/Time";
import List "mo:core/List";

actor {
  type Message = {
    name : Text;
    email : Text;
    text : Text;
    number : Text;
    timestamp : Time.Time;
  };

  let messages = List.empty<Message>();

  public shared ({ caller }) func submitMessage(name : Text, email : Text, number : Text, text : Text) : async () {
    let message : Message = {
      name;
      email;
      text;
      number;
      timestamp = Time.now();
    };
    messages.add(message);
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    messages.toArray();
  };
};
