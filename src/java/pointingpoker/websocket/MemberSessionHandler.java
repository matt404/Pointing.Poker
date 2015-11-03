/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pointingpoker.websocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import javax.enterprise.context.ApplicationScoped;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.JsonObject;
import javax.json.spi.JsonProvider;
import javax.websocket.Session;
import pointingpoker.model.Member;

@ApplicationScoped
public class MemberSessionHandler {

	private int memberId = 0;
//	private final Set<Session> sessions = new HashSet();
//	private final Set<Member> members = new HashSet();
	private final Map<String, Set<Session>> sessions = new HashMap<>();
	private final Map<String, Set<Member>> members = new HashMap<>();

	public void addSession(Session session, String roomKey) {
		if(!sessions.containsKey(roomKey)){
			sessions.put(roomKey, new HashSet());
		}
		sessions.get(roomKey).add(session);
		if(members.containsKey(roomKey)){
			for (Member member : members.get(roomKey)) {
				JsonObject addMessage = createAddMessage(member);
				sendToSession(session, addMessage, roomKey);
			}
		}
	}

	public void addMember(Member member, String roomKey) {
		if(members.containsKey(roomKey)){
			for (Member mbr : members.get(roomKey)) {
				if (member.getName().toLowerCase().equals(mbr.getName().toLowerCase())) {
					removeMember(mbr.getId(), roomKey);
				}
			}			
		}else{
			members.put(roomKey, new HashSet());
		}
		memberId++;
		member.setId(memberId);
		members.get(roomKey).add(member);
		JsonObject addMessage = createAddMessage(member);
		sendToAllConnectedSessions(addMessage, roomKey);
//		if(!member.getObserver()){
//			startNewGame();
//		}
	}

	private Member getMemberById(int id, String roomKey) {
		if(members.containsKey(roomKey)){
			for (Member member : members.get(roomKey)) {
				if (member.getId() == id) {
					return member;
				}
			}
		}
		return null;
	}

	private JsonObject createAddMessage(Member member) {
		JsonProvider provider = JsonProvider.provider();
		JsonObject addMessage = provider.createObjectBuilder()
				.add("action", "add")
				.add("id", member.getId())
				.add("name", member.getName())
				.add("vote", member.getVote())
				.add("clientKey", member.getClientKey())
				.add("observer", member.getObserver())
				.build();
		return addMessage;
	}

	public void removeMemberByClientKey(int clientKey, String roomKey) {
		for (Member member : members.get(roomKey)) {
			if(member.getClientKey().equals(clientKey)){
				removeMember(member.getId(), roomKey);
			}
		}		
	}
	
	public void removeMember(int id, String roomKey) {
		Member member = getMemberById(id, roomKey);
		if (member != null) {
			members.get(roomKey).remove(member);
			JsonProvider provider = JsonProvider.provider();
			JsonObject removeMessage = provider.createObjectBuilder()
					.add("action", "remove")
					.add("id", id)
					.build();
			sendToAllConnectedSessions(removeMessage, roomKey);
		}
	}

    public void removeSession(Session session, String roomKey) {
		if(sessions.containsKey(roomKey)){
			sessions.get(roomKey).remove(session);
		}
    }
	
	private void sendToAllConnectedSessions(JsonObject message, String roomKey) {
		if(sessions.containsKey(roomKey)){
			for (Session session : sessions.get(roomKey)) {
				sendToSession(session, message, roomKey);
			}
		}
	}

	private void sendToSession(Session session, JsonObject message, String roomKey) {
		try {
			session.getBasicRemote().sendText(message.toString());
		} catch (IOException ex) {
			if(sessions.containsKey(roomKey)){
				sessions.get(roomKey).remove(session);
			}
			Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.SEVERE, null, ex);
		}
	}

	public void startNewGame(String roomKey) {
		for (Member member : members.get(roomKey)) {
			member.setVote("");
		}
		JsonProvider provider = JsonProvider.provider();
		JsonObject newGameMessage = provider.createObjectBuilder()
				.add("action", "newgame")
				.build();
		sendToAllConnectedSessions(newGameMessage, roomKey);
	}

	public void submitVote(int id, String vote, String roomKey) {
		JsonProvider provider = JsonProvider.provider();
		Member member = getMemberById(id, roomKey);
		if (member != null) {
			member.setVote(vote);
			JsonObject updateDevMessage = provider.createObjectBuilder()
					.add("action", "vote")
					.add("id", member.getId())
					.add("vote", vote)
					.build();
			sendToAllConnectedSessions(updateDevMessage, roomKey);
		}
		checkForGameComplete(roomKey);
	}

	public void checkForGameComplete(String roomKey) {
		Boolean gameIsComplete = true;

		for (Member member : members.get(roomKey)) {
			if(!member.getObserver() && member.getVote().isEmpty()){
				gameIsComplete = false;
				break;
			}
		}
		
		if (gameIsComplete) {
			JsonProvider provider = JsonProvider.provider();
			JsonObject showCardsMessage = provider.createObjectBuilder()
					.add("action", "showcards")
					.build();
			sendToAllConnectedSessions(showCardsMessage, roomKey);
		}
	}

	public List getMembers(String roomKey) {
		return new ArrayList<>(members.get(roomKey));
	}

}
