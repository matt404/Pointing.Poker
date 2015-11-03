
package pointingpoker.websocket;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.websocket.server.PathParam;
import pointingpoker.model.Member;

@ApplicationScoped
@ServerEndpoint("/member/actions/{clientKey}/{roomKey}")
public class MemberWebSocketServer {
	private int clientKey; 
	private String roomKey; 

	@Inject
	private MemberSessionHandler sessionHandler;

	@OnOpen
	public void open(@PathParam("clientKey") int clientKey, @PathParam("roomKey") String roomKey, Session session) {
		this.clientKey = clientKey;
		this.roomKey = roomKey.toLowerCase();
		sessionHandler.addSession(session, this.roomKey);
	}

	@OnClose
	public void close(Session session) {
		sessionHandler.removeSession(session, this.roomKey);
		sessionHandler.removeMemberByClientKey(clientKey, roomKey);
	}

	@OnError
	public void onError(Throwable error) {
		Logger.getLogger(MemberWebSocketServer.class.getName()).log(Level.SEVERE, null, error);
	}

	@OnMessage
	public void handleMessage(String message, Session session) {

        try (JsonReader reader = Json.createReader(new StringReader(message))) {
            JsonObject jsonMessage = reader.readObject();

            if ("add".equals(jsonMessage.getString("action"))) {
                Member member = new Member();
                member.setName(jsonMessage.getString("name"));
                member.setClientKey(jsonMessage.getInt("clientKey"));
                member.setObserver(jsonMessage.getBoolean("observer"));
                sessionHandler.addMember(member, this.roomKey);
            }

            if ("remove".equals(jsonMessage.getString("action"))) {
                int id = (int) jsonMessage.getInt("id");
                sessionHandler.removeMember(id, this.roomKey);
            }

            if ("vote".equals(jsonMessage.getString("action"))) {
                int id = (int) jsonMessage.getInt("id");
                String vote = jsonMessage.getString("vote");
                sessionHandler.submitVote(id, vote, this.roomKey);
            }
            if ("newgame".equals(jsonMessage.getString("action"))) {
                sessionHandler.startNewGame(this.roomKey);
            }
        }
	}
}
