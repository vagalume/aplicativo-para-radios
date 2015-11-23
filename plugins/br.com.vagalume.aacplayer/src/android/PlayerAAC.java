package br.com.vagalume.plugin;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;
import android.media.AudioTrack;
import com.spoledge.aacdecoder.MultiPlayer;
import com.spoledge.aacdecoder.PlayerCallback;
import com.spoledge.aacdecoder.AACPlayer;

public class PlayerAAC extends CordovaPlugin implements PlayerCallback {

    protected MultiPlayer multiPlayer = null;
    protected Integer status = null;
    protected Boolean mWaitingToPlay;
    protected String streaming;
    protected CallbackContext callback;

    @Override
    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {

        if (action.equals("setStream")) {
            streaming = data.getString(0);
            prepareToPlay();
            return true;
        } else if (action.equals("stop")) {
            if (multiPlayer != null && status == 2) {
                multiPlayer.stop();
                multiPlayer = null;
                changeStatus(4);
            }
            return true;
        } else if (action.equals("play")) {            
            prepareToPlay();
            return true;
        } else if (action.equals("getStatus")) {
            if (status != null) {
                callbackContext.success(status);
            } else {
                callbackContext.error("no_status");
            }
            return true;
        } else if(action.equals("statusCallback")) {
            callback = callbackContext;
            return true;
        } else if (action.equals("destroy")) {
            multiPlayer.stop();
            multiPlayer = null;
            status = null;
            callback = null;
            super.onDestroy();        
            return true;
        } else {
            return false;
        }
    }

    public void changeStatus(Integer code) {
        if(callback != null) {
            try {
                if (code != status) {
                    status = code;
                    PluginResult result = new PluginResult(PluginResult.Status.OK, code);
                    result.setKeepCallback(true);
                    callback.sendPluginResult(result);                    
                }
            } catch (Exception e) {
                // Erro
            }
        }
    }

    public void prepareToPlay() {
        if (multiPlayer != null && (status == 2 || status == 1)) {
            multiPlayer.stop();
        }

        multiPlayer = null;
        multiPlayer = new MultiPlayer(this, AACPlayer.DEFAULT_AUDIO_BUFFER_CAPACITY_MS, AACPlayer.DEFAULT_DECODE_BUFFER_CAPACITY_MS);
        multiPlayer.playAsync(streaming);
        changeStatus(1);
    }

    public void playerStarted() {
        changeStatus(2);
    }

    public void playerPCMFeedBuffer(boolean isPlaying, int audioBufferSizeMs, int audioBufferCapacityMs) {        
        if (!isPlaying) {
            changeStatus(1);
        }
    }

    public void playerStopped(int perf) {        
        changeStatus(4);
    }

    public void playerException(Throwable t) {
        changeStatus(4);
    }

    public void playerMetadata(String key, String value) {        
    }

    public void playerAudioTrackCreated(AudioTrack audioTrack) {
    }

    public void MediaPlayerEnhanced() {        
    }
}
