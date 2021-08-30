# RANDRAW

![qr](/qr.png)

Silly image generator.

1. Upload your own image
2. Click play
3. Observe how random algorithms try to reproduce it
4. ??????
5. Amusement? idk

## Indicators

- **Distance**: the percentage shows the distance from the source-to-white comparison to the perfect match, the number after that shows absolute RGB distance from source to the target. E.g. black source image would have absolute distance `1` compared to initial white target, but most images have absolute distance `<1` as they have pixels between white and black. The percentage is different as it considers the initial source-to-white difference as 100%, even though in absolute numbers it's `<1`, and then it counts down percentages between `0` and that initial distance. E.g. if your source image has distance-to-while `0.2` - this will be shown as 100%, and then when it gets to distance `0.1` it will appear as 50%.

- **Iteration**: `{successful} / {total}` . First number shows how many iterations ended up adding a figure and improving the image. The second number shows how many attempts there have been made in total. First number also means how many different random elements there are in total in the current generated image.

- **Time**: that's a lie right now, don't pay attention to it.

## Supports some configuration options now

- **Greyscale drawing**: ratio of how many new figures will be forced to be greyscale
- **Greyscale compare**: will compare as if source was greyscale
- **Opacity range**: sets minimum and maximum allowed opacity for new figures
- **Max size range**: sets minimum and maximum allowed size for new figures (in ratio compared to the whole canvas)
- **Size to distance bias**: ok this one is stupid - by default, as the distance percentage goes down, some bias toward smaller figures is being added with the formula: `X% of the time the generated figure will get reduced by up to Y%`, where both `X` and `Y` are equal to `100 - DISTANCE_PERCENT` %. E.g. if current distance percentage is `80%` - it means 20% of the time figures will be reduced by **up to** 20% (not always by this much, but by a random factor up to this limit). This config controls the `X` parameter in this formula, as long as it sits in the middle (`0.5`) - the chance of the bias will be equal exactly to `100 - DISTANCE_PERCENT` %. If you increase the parameter (`0.51 - 1`) - it will gradually get more and more probable up until the chance being equal to `100%` when the parameter is at `1`. If you decrease the parameter (`0 - 0.49`) - it will gradually get less and less probable with `0%` chance when the parameter is at `0`. But remember that when parameter is at `0.5` - the chance is not 50%, the chance is controlled by the distance then. So by changing the parameter you are changing how much the distance is affecting the bias.