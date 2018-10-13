package com.kam.the3techies;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomNavigationView;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MenuItem;
import android.widget.TextView;
import com.genesys.workspace.WorkspaceApi;
import com.genesys.workspace.common.WorkspaceApiException;
import com.genesys.workspace.events.CallStateChanged;
import com.genesys.workspace.events.DnStateChanged;
import com.genesys.workspace.models.AgentWorkMode;
import com.genesys.workspace.models.Call;
import com.genesys.workspace.models.Dn;
import com.genesys.workspace.models.User;
import java.util.concurrent.CompletableFuture;


public class MainActivity extends AppCompatActivity {
    static boolean hasCallBeenHeld = false;
    static final CompletableFuture<Void> done = new CompletableFuture<>();
    private TextView mTextMessage;
    private String TAG = "The3Techies";

    public static void AuthMe() throws Exception{
        String apiKey = "iB4b9IG8536FQCKiPlyXL9wJYfKbALKT4GZW9VGu";
        String apiUrl = "https://gapi-use1.genesyscloud.com";
        WorkspaceApi api = new WorkspaceApi(apiKey, apiUrl);
        api.voice().addCallEventListener((CallStateChanged msg) -> {
            try {
                Call call = msg.getCall();
                String id = call.getId();

                switch (call.getState()) {

                    case RINGING:
                        System.out.println("Answering call...");
                        api.voice().answerCall(call.getId());
                        break;

                    case ESTABLISHED:
                        if (!hasCallBeenHeld) {
                            System.out.println("Putting call on hold...");
                            api.voice().holdCall(id);
                            hasCallBeenHeld = true;
                        } else {
                            System.out.println("Releasing call...");
                            api.voice().releaseCall(id);
                        }
                        break;

                    case HELD:
                        System.out.println("Retrieving call...");
                        api.voice().retrieveCall(id);
                        break;

                    case RELEASED:
                        System.out.println("Setting ACW...");
                        api.voice().setAgentNotReady("AfterCallWork", null);
                        break;
                    //endregion
                }
            } catch(WorkspaceApiException e) {
                System.err.println(e);

                done.completeExceptionally(e);
            }
        });


        api.voice().addDnEventListener((DnStateChanged msg) -> {
            Dn dn = msg.getDn();

            if (hasCallBeenHeld && AgentWorkMode.AFTER_CALL_WORK == dn.getWorkMode()) {
                done.complete(null);
            }
            //endregion
        });

        String authorizationToken = "<authorizationToken2>";
        //endregion

        //region Initialization
        //Initialize the Workspace API with the authorization token from the previous step. Finally, call `activateChannels()` to initialize the voice channel for the agent and DN.
        User user = api.initialize(authorizationToken);
        api.activateChannels(user.getAgentId(), user.getAgentId());
        //endregion
        Log.e("Waiting", "Waiting for completion...");
        System.out.println("Waiting for completion...");
        done.get();

        api.destroy();
    }

    private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener
            = new BottomNavigationView.OnNavigationItemSelectedListener() {

        @Override
        public boolean onNavigationItemSelected(@NonNull MenuItem item)  {
            switch (item.getItemId()) {
                case R.id.navigation_home:
                    mTextMessage.setText(R.string.title_home);
                    return true;
                case R.id.navigation_dashboard:
                    mTextMessage.setText(R.string.title_dashboard);
                    return true;
                case R.id.navigation_notifications:
                    mTextMessage.setText(R.string.title_notifications);
                    return true;
            }
            return false;
        }
    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mTextMessage = (TextView) findViewById(R.id.message);
        BottomNavigationView navigation = (BottomNavigationView) findViewById(R.id.navigation);
        navigation.setOnNavigationItemSelectedListener(mOnNavigationItemSelectedListener);
    }


    private void runinBackground(){}
    MainActivity.execute(new Runnable() {
        @Override
        public void run() {
            // All your networking logic
            // should be here
        }
    });
}
