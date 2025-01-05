from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt


@login_required(login_url="/login/")
def index(request):
    return render(request, "frontend/index.html")


@csrf_exempt
def login_view(request: HttpRequest):
    # Check if the user is already logged in
    # Default to "/" if no "next" is provided
    next_url = request.GET.get("next", "/")

    if request.user.is_authenticated:
        return redirect(next_url)

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Log the user in
            login(request, user)

            # Redirect to the next URL or default
            return JsonResponse({"message": "Login successful"})
        else:
            # Add an error message if authentication fails
            return JsonResponse(
                {"message": "Invalid username or password."}, status=401
            )

    return render(request, "frontend/login.html")


@csrf_exempt
def logout_view(request):
    is_post = request.method == "POST"
    post_response = {"message": "Logout successful", "status": 200}

    try:
        logout(request)
    except Exception as e:
        print(e)
        post_response = {"message": "Logout failed", "status": 500}

    if is_post:
        return JsonResponse(
            {"message": post_response["message"]}, status=post_response["status"]
        )

    return HttpResponseRedirect("/login/")
