package us.hearye.voting;

import android.os.Bundle;

import com.reactnativenavigation.NavigationActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends NavigationActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        RNBootSplash.init(R.drawable.splash, MainActivity.this);
    }
}
