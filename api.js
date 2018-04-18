setTimeout(function() {
    inject();
}, 100)

function traceMethod(targetClassMethod, onPerformingHook) {
    var delim = targetClassMethod.lastIndexOf(".");
    if (delim === -1) return;

    var targetClass = targetClassMethod.slice(0, delim);
    var targetMethod = targetClassMethod.slice(delim + 1, targetClassMethod.length);

    var hook;
    try {
        hook = Java.use(targetClass);
    } catch (err) {
        return;
    }

    if (typeof hook[targetMethod] == 'undefined') {
        return;
    }

    var overloadCount = hook[targetMethod].overloads.length;

    send("Tracing java method " + targetClassMethod + " [" + overloadCount + " overload(s)]");

    for (var i = 0; i < overloadCount; i++) {
        hook[targetMethod].overloads[i].implementation = function() {
            var retval = this[targetMethod].apply(this, arguments);

            var args = arguments;
            Java.perform(function() {
                onPerformingHook(targetClassMethod, args);
            });
            return retval;
        }
    }
}

function hookMATEncryption(targetClassMethod, args) {
    send('[' + targetClassMethod + ']' + args[0]);
}

function inject() {
//    var base = Process.findModuleByName("libg.so").base;
//    send('libg base: ' + base)

    Java.perform(function() {
        traceMethod("com.mobileapptracker.MATEncryption.encrypt", hookMATEncryption);
    })

    Java.perform(function() {
        traceMethod("com.mobileapptracker.MATEncryption.decrypt", hookMATEncryption);
    })

}