/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pointingpoker.model;


public class Member {

    private int id;
    private String name;
//    private String roomKey = "";
    private String vote = "";
    private Integer clientKey = 0;
    private Boolean observer = false;

    public Member() {
    }
    
    public int getId() {
        return id;
    }
    
    public Integer getClientKey() {
        return clientKey;
    }

    public String getName() {
        return name;
    }

//	public String getRoomKey() {
//        return roomKey;
//    }

    public String getVote() {
        return vote;
    }

    public Boolean getObserver() {
        return observer;
    }

    public void setId(int id) {
        this.id = id;
    }
    
    public void setClientKey(Integer clientKey) {
        this.clientKey = clientKey;
    }

    public void setName(String name) {
        this.name = name;
    }

//    public void setRoomKey(String roomKey) {
//        this.roomKey = roomKey;
//    }

    public void setVote(String vote) {
        this.vote = vote;
    }
    
    public void setObserver(Boolean observer) {
        this.observer = observer;
    }
}