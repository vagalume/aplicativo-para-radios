package com.homerours.musiccontrols;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MusicControlsInfos{
	public String artist;
	public String track;
	public String subText;
	public String ticker;
	public String coverURL;
	public boolean isPlaying;

	public MusicControlsInfos(JSONArray args) throws JSONException {
		final JSONObject params = args.getJSONObject(0);
		this.track = params.getString("track");
		this.artist = params.getString("artist");
		this.subText = params.getString("subText");
		this.ticker = params.getString("ticker");
		this.coverURL = params.getString("cover");
		this.isPlaying= params.getBoolean("isPlaying");
	}
}
