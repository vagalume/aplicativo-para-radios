package com.homerours.musiccontrols;

import org.apache.cordova.CordovaInterface;


import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Random;

import android.util.Log;
import android.R;

import android.graphics.Color;
import android.content.Context;
import android.app.Activity;
import android.content.res.Resources;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Bundle;
import android.os.Build;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.net.Uri;

public class MusicControlsNotification {
	private Activity cordovaActivity;
	private NotificationManager notificationManager;
	private Notification.Builder notificationBuilder;
	private int notificationID;
	private MusicControlsInfos infos;
	private int play_btn;
	private int pause_btn;
	private int close_btn;
	private String currentCoverURL;
	private Bitmap currentCover;

	public MusicControlsNotification(Activity cordovaActivity,int id) {
		this.notificationID = id;
		this.cordovaActivity = cordovaActivity;
		Context context = cordovaActivity;
		this.notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);

		// Load Resources
		String packageName = cordovaActivity.getApplication().getPackageName();
		Resources res = cordovaActivity.getApplication().getResources();
		play_btn = res.getIdentifier("ic_play_arrow", "drawable", packageName);
		pause_btn = res.getIdentifier("ic_pause", "drawable", packageName);
		close_btn = res.getIdentifier("ic_close", "drawable", packageName);
	}

	private Bitmap getBitmapFromURL(String strURL) {
		try {
			URL url = new URL(strURL);
			HttpURLConnection connection = (HttpURLConnection) url.openConnection();
			connection.setDoInput(true);
			connection.connect();
			InputStream input = connection.getInputStream();
			Bitmap myBitmap = BitmapFactory.decodeStream(input);
			return myBitmap;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	private void createBuilder() {
		Context context = cordovaActivity;
		Notification.Builder builder = new Notification.Builder(context);

		//Configure builder
		builder.setContentTitle(infos.track);
		if (!infos.artist.isEmpty()){
			builder.setContentText(infos.artist);			
		}
		if (!infos.subText.isEmpty()) {
			builder.setSubText(infos.subText);
		}

		builder.setWhen(0);
		builder.setOngoing(true);
		if (!infos.ticker.isEmpty()){
			builder.setTicker(infos.ticker);
		}
		builder.setPriority(Notification.PRIORITY_MAX);

		//If 5.0 >= use MediaStyle
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
			builder.setStyle(new Notification.MediaStyle()
				// Action indexes to be shown on compact view
				.setShowActionsInCompactView(new int[] {0, 1}));

			// Set color
			builder.setColor(Color.BLACK);
		}

		//Set SmallIcon
		builder.setSmallIcon(getIconResId());

		//Set LargeIcon
		if (!infos.coverURL.isEmpty()) {
			// If is the same cover, uses the one in memory already
			if (infos.coverURL.equals(this.currentCoverURL)) {
				builder.setLargeIcon(this.currentCover);
			// else download or load it from disk
			} else {
				if(infos.coverURL.matches("^(https?|ftp)://.*$")) {
					try {
						this.currentCoverURL = infos.coverURL;
						this.currentCover = cropImage(getBitmapFromURL(infos.coverURL));						
						builder.setLargeIcon(this.currentCover);
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				} else {
					try {
						Uri uri = Uri.parse(infos.coverURL);
						File file = new File(uri.getPath());
						FileInputStream fileStream = new FileInputStream(file);
						BufferedInputStream buf = new BufferedInputStream(fileStream);
						Bitmap image = BitmapFactory.decodeStream(buf);
						buf.close();
						this.currentCoverURL = infos.coverURL;
						this.currentCover = cropImage(image);
						builder.setLargeIcon(this.currentCover);
					} catch (Exception ex) {
						ex.printStackTrace();
					}
				}
			}
		}

		//Open app if tapped
		Intent resultIntent = new Intent(context, cordovaActivity.getClass());
		resultIntent.setAction(Intent.ACTION_MAIN);
		resultIntent.addCategory(Intent.CATEGORY_LAUNCHER);
		PendingIntent resultPendingIntent = PendingIntent.getActivity(context, 0, resultIntent, 0);
		builder.setContentIntent(resultPendingIntent);

		//Controls		
		if (infos.isPlaying){
			/* Pause  */
			Intent pauseIntent = new Intent("music-controls-pause");
			PendingIntent pausePendingIntent = PendingIntent.getBroadcast(context, 1, pauseIntent, 0);
			builder.addAction(pause_btn, "", pausePendingIntent);
			//this.playpauseAction = new Notification.Action(pause_btn, "", pausePendingIntent); //ANDROID 5+
			//builder.addAction(playpauseAction); //ANDROID 5+
		} else {
			/* Play  */
			Intent playIntent = new Intent("music-controls-play");
			PendingIntent playPendingIntent = PendingIntent.getBroadcast(context, 1, playIntent, 0);
			builder.addAction(play_btn, "", playPendingIntent);
			//this.playpauseAction = new Notification.Action(play_btn, "", playPendingIntent); //ANDROID 5+
			//builder.addAction(playpauseAction); //ANDROID 5+
		}

		//builder.addAction(playpauseAction); //ANDROID 5+

		/* Close */
		Intent closeIntent = new Intent("music-controls-close");
		PendingIntent closePendingIntent = PendingIntent.getBroadcast(context, 1, closeIntent, 0);
		builder.addAction(close_btn, "", closePendingIntent);

		this.notificationBuilder = builder;
	}

	private Bitmap cropImage(Bitmap image) {
		Bitmap dstBmp;
		if (image.getWidth() >= image.getHeight()){
			dstBmp = Bitmap.createBitmap(
				image, 
				image.getWidth()/2 - image.getHeight()/2,
				0,
				image.getHeight(), 
				image.getHeight()
				);
		} else{
			dstBmp = Bitmap.createBitmap(
				image,
				0, 
				image.getHeight()/2 - image.getWidth()/2,
				image.getWidth(),
				image.getWidth() 
				);
		}
		return dstBmp;
	}

	public void updateNotification(MusicControlsInfos infos) {
		this.infos = infos;
		this.createBuilder();
		this.notificationManager.notify(this.notificationID, this.notificationBuilder.build());
	}

	public void updateIsPlaying(boolean isPlaying) {
		/* ANDROID 5+ */
		// Context context = cordovaActivity;
		// if (isPlaying) {
		// 	/* Pause  */
		// 	this.notificationBuilder.setSmallIcon(pause_btn);
		// 	Intent pauseIntent = new Intent("music-controls-pause");
		// 	PendingIntent pausePendingIntent = PendingIntent.getBroadcast(context, 1, pauseIntent, 0);
		// 	this.playpauseAction.icon = pause_btn;
		// 	this.playpauseAction.actionIntent = pausePendingIntent;
		// } else {
		// 	/* Play  */
		// 	this.notificationBuilder.setSmallIcon(play_btn);
		// 	Intent playIntent = new Intent("music-controls-play");
		// 	PendingIntent playPendingIntent = PendingIntent.getBroadcast(context, 1, playIntent, 0);
		// 	this.playpauseAction.icon = play_btn;
		// 	this.playpauseAction.actionIntent = playPendingIntent;
		// }
		/* ---------- */

		this.infos.isPlaying = isPlaying;
		this.createBuilder();
		this.notificationManager.notify(this.notificationID, this.notificationBuilder.build());
	}

	public void destroy() {
		this.notificationManager.cancel(this.notificationID);
	}

	private int getIconResId() {
		Context context = cordovaActivity;
		Resources res   = context.getResources();
		String pkgName  = context.getPackageName();

		int resId;
		resId = res.getIdentifier("ic_vagalume", "drawable", pkgName);

		return resId;
	}
}